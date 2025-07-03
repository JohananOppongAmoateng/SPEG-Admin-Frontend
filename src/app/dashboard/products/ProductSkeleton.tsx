import React from 'react';
import { 
  Skeleton,
  Card, 
  CardContent, 
  CardActions, 
  Grid, 
  Box 
} from '@mui/material';

const ProductSkeleton = ({ count = 6 }) => {
  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {Array.from(new Array(count)).map((_, index) => (
        <Grid item xs={12} sm={6} lg={4} key={index}>
          <Card
            elevation={3}
            sx={{
              height: '100%',
              width: '80%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Image skeleton */}
            <Skeleton
              variant="rectangular"
              sx={{ paddingTop: '66.66%' }}
              animation="wave"
            />

            <CardContent sx={{ flexGrow: 1, pt: 3 }}>
              {/* Product name skeleton */}
              <Skeleton 
                variant="text" 
                sx={{ fontSize: '2rem', width: '75%', mb: 2 }}
                animation="wave"
              />

              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Price row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skeleton variant="text" width={60} animation="wave" />
                  <Skeleton variant="text" width={100} animation="wave" />
                </Box>

                {/* Stock row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skeleton variant="text" width={60} animation="wave" />
                  <Skeleton variant="text" width={60} animation="wave" />
                </Box>

                {/* Reorder level row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skeleton variant="text" width={100} animation="wave" />
                  <Skeleton variant="text" width={60} animation="wave" />
                </Box>
              </Box>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={40} 
                animation="wave"
                sx={{ borderRadius: 1 }}
              />
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={40} 
                animation="wave"
                sx={{ borderRadius: 1 }}
              />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductSkeleton;