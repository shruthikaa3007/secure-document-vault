from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging
import re
import nltk
import spacy
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from transformers import pipeline
import traceback

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download necessary NLTK data
try:
    nltk.download("punkt", quiet=True)
    nltk.download("stopwords", quiet=True)
    nltk.download("wordnet", quiet=True)
    nltk.download("averaged_perceptron_tagger", quiet=True)
    logger.info("NLTK resources downloaded successfully")
except Exception as e:
    logger.error(f"Failed to download NLTK resources: {e}")

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
    logger.info("spaCy model loaded successfully")
except:
    try:
        import spacy.cli
        logger.info("Downloading spaCy model...")
        spacy.cli.download("en_core_web_sm")
        nlp = spacy.load("en_core_web_sm")
        logger.info("spaCy model downloaded and loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load spaCy model: {e}")
        nlp = None

# Load summarization pipeline
try:
    logger.info("Initializing summarization pipeline...")
    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", revision="a4f8f3e")
    logger.info("Summarization pipeline initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize summarizer: {e}")
    summarizer = None

# FastAPI app
app = FastAPI(title="Document Auto-Tagger API")

# Request/Response models
class TextRequest(BaseModel):
    text: str

class TagResponse(BaseModel):
    keywords: List[str]
    entities: List[str]
    summary: Optional[str]

# Utility: Preprocess
def preprocess_text(text: str):
    try:
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\d+', '', text)
        tokens = word_tokenize(text)
        stop_words = set(stopwords.words('english'))
        tokens = [t for t in tokens if t not in stop_words]
        lemmatizer = WordNetLemmatizer()
        tokens = [lemmatizer.lemmatize(t) for t in tokens]
        return tokens
    except Exception as e:
        logger.error(f"Error in preprocess_text: {e}")
        return []

# Utility: Extract Keywords
def extract_keywords(tokens, confidence_threshold=0.6):
    try:
        if not tokens:
            return []
            
        freq_dist = nltk.FreqDist(tokens)
        pos_tags = nltk.pos_tag(tokens)
        keywords = []
        
        for word, tag in pos_tags:
            if tag.startswith(("NN", "JJ")) and len(word) > 3:
                confidence = min(1.0, freq_dist[word] / 10)
                if confidence >= confidence_threshold:
                    keywords.append(word)
                    
        return list(dict.fromkeys(keywords))[:10]  # Return up to 10 unique keywords
    except Exception as e:
        logger.error(f"Error in extract_keywords: {e}")
        return []

# Utility: Extract Entities
def extract_entities(text):
    try:
        if not nlp or not text:
            return []
            
        doc = nlp(text[:100000])  # Limit text length to avoid memory issues
        
        return list(dict.fromkeys([
            ent.text.strip().lower()
            for ent in doc.ents
            if ent.label_ in {"PERSON", "ORG", "GPE", "DATE", "PRODUCT"}
        ]))[:10]  # Return up to 10 unique entities
    except Exception as e:
        logger.error(f"Error in extract_entities: {e}")
        return []

# Utility: Summarize
def generate_summary(text: str, max_length=150):
    try:
        if not summarizer or len(text.split()) < 50:
            # For short texts or if summarizer is not available, return the first sentence
            first_sentence = text.strip().split(".")[0]
            return first_sentence + "." if first_sentence else ""
            
        # Limit text length to avoid memory issues
        text = text[:10000]
        
        summary = summarizer(text, max_length=max_length, min_length=30, do_sample=False)
        return summary[0]['summary_text']
    except Exception as e:
        logger.error(f"Summary generation failed: {e}")
        # Return a truncated version of the text as fallback
        return text[:max_length] + "..." if text else ""

# Main API endpoint
@app.post("/tag", response_model=TagResponse)
async def tag_document(req: TextRequest):
    if not req.text or len(req.text) < 10:
        raise HTTPException(status_code=400, detail="Text too short for analysis")

    try:
        logger.info(f"Processing text of length: {len(req.text)}")
        
        # Process text in chunks if it's very large
        text = req.text[:50000]  # Limit to 50k characters to avoid memory issues
        
        tokens = preprocess_text(text)
        keywords = extract_keywords(tokens)
        entities = extract_entities(text)
        summary = generate_summary(text)

        logger.info(f"Processing complete. Keywords: {len(keywords)}, Entities: {len(entities)}, Summary length: {len(summary) if summary else 0}")
        
        return TagResponse(
            keywords=keywords,
            entities=entities,
            summary=summary
        )
    except Exception as e:
        logger.error(f"Processing error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal processing error: {str(e)}")

# Health check
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "spacy_model": "loaded" if nlp else "not loaded",
        "summarizer": "available" if summarizer else "unavailable"
    }

# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("auto_tagger_service:app", host="0.0.0.0", port=8000, reload=True)