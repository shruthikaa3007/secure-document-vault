import React from 'react';
import { 
  Card, CardContent, CardActions, Typography, Chip, Box, 
  IconButton, Tooltip, Divider, Avatar
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const DocumentCard = ({ 
  document, 
  onView, 
  onDownload, 
  onEdit, 
  onDelete, 
  showActions = true,
  getClassificationColor,
  sx = {},
  ...rest
}) => {
  // Default color mapping if getClassificationColor is not provided
  const getColor = (classification) => {
    if (getClassificationColor) {
      return getClassificationColor(classification);
    }
    
    switch (classification) {
      case 'Public':
        return 'success';
      case 'Internal':
        return 'primary';
      case 'Confidential':
        return 'warning';
      case 'Restricted':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get owner name
  const getOwnerName = () => {
    if (!document.owner) return 'Unknown';
    if (typeof document.owner === 'string') return document.owner;
    return document.owner.username || document.owner.email || 'Unknown';
  };

  // Get tags to display (max 3)
  const displayTags = () => {
    if (!document.tags || document.tags.length === 0) return [];
    
    const tags = Array.isArray(document.tags) ? document.tags : [document.tags];
    
    if (tags.length <= 3) return tags;
    
    return [...tags.slice(0, 3), `+${tags.length - 3} more`];
  };

  // Get classification color for the chip
  const getChipColor = (classification) => {
    const color = getColor(classification);
    // If the color is a valid MUI color, use it directly
    if (['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'].includes(color)) {
      return color;
    }
    // Otherwise, use 'default' and apply custom styling if needed
    return 'default';
  };

  return (
    <Card 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        borderLeft: '4px solid',
        borderLeftColor: (theme) => {
          const color = getColor(document.classification);
          // If the color is a valid MUI color, get it from the theme
          if (['primary', 'secondary', 'error', 'info', 'success', 'warning'].includes(color)) {
            return theme.palette[color].main;
          }
          // If it's a hex color, use it directly
          if (color.startsWith('#')) {
            return color;
          }
          // Default fallback
          return theme.palette.grey[400];
        },
        ...sx
      }}
      {...rest}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              mb: 1
            }}
          >
            {document.fileName || 'Unknown Document'}
          </Typography>
          <Chip 
            label={document.classification || 'Unclassified'} 
            size="small" 
            color={getChipColor(document.classification)}
            sx={{ 
              ml: 1, 
              flexShrink: 0,
              bgcolor: (theme) => {
                const color = getColor(document.classification);
                // If it's a hex color and not a MUI color, use it as background
                if (color.startsWith('#')) {
                  return color;
                }
                return undefined; // Let MUI handle it for theme colors
              },
              color: (theme) => {
                const color = getColor(document.classification);
                // If it's a hex color, determine text color based on background
                if (color.startsWith('#')) {
                  // Simple contrast check - use white text on dark backgrounds, black on light
                  const r = parseInt(color.slice(1, 3), 16);
                  const g = parseInt(color.slice(3, 5), 16);
                  const b = parseInt(color.slice(5, 7), 16);
                  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                  return brightness > 128 ? 'rgba(0, 0, 0, 0.87)' : '#fff';
                }
                return undefined; // Let MUI handle it for theme colors
              }
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar 
            sx={{ 
              width: 24, 
              height: 24, 
              fontSize: '0.75rem',
              bgcolor: 'primary.main',
              mr: 1
            }}
          >
            {getOwnerName().charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {getOwnerName()}
          </Typography>
        </Box>
        
        {document.department && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Department: {document.department}
          </Typography>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Uploaded: {formatDate(document.createdAt || document.uploadDate)}
        </Typography>
        
        {displayTags().length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {displayTags().map((tag, index) => (
              <Chip 
                key={index} 
                label={tag} 
                size="small" 
                variant="outlined"
                sx={{ 
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>
      
      <Divider />
      
      {showActions && (
        <CardActions>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box>
              {onView && (
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => onView(document._id || document.id)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {onDownload && (
                <Tooltip title="Download">
                  <IconButton size="small" onClick={() => onDownload(document._id || document.id)}>
                    <GetAppIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            
            <Box>
              {onEdit && (
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => onEdit(document)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {onDelete && (
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => onDelete(document)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </CardActions>
      )}
    </Card>
  );
};

export default DocumentCard;