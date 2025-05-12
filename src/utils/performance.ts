interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface PerformanceLayoutShift extends PerformanceEntry {
  value: number;
}

export const measurePerformance = (): PerformanceMetric[] => {
  const metrics: PerformanceMetric[] = [];

  // First Contentful Paint (FCP)
  const fcp = performance.getEntriesByName('first-contentful-paint')[0];
  if (fcp) {
    metrics.push({
      name: 'First Contentful Paint',
      value: fcp.startTime,
      rating: fcp.startTime < 1800 ? 'good' : fcp.startTime < 3000 ? 'needs-improvement' : 'poor'
    });
  }

  // Largest Contentful Paint (LCP)
  const lcp = performance.getEntriesByName('largest-contentful-paint')[0];
  if (lcp) {
    metrics.push({
      name: 'Largest Contentful Paint',
      value: lcp.startTime,
      rating: lcp.startTime < 2500 ? 'good' : lcp.startTime < 4000 ? 'needs-improvement' : 'poor'
    });
  }

  // First Input Delay (FID)
  const fid = performance.getEntriesByName('first-input-delay')[0];
  if (fid) {
    metrics.push({
      name: 'First Input Delay',
      value: fid.duration,
      rating: fid.duration < 100 ? 'good' : fid.duration < 300 ? 'needs-improvement' : 'poor'
    });
  }

  // Cumulative Layout Shift (CLS)
  const cls = performance.getEntriesByName('layout-shift')[0] as PerformanceLayoutShift;
  if (cls) {
    metrics.push({
      name: 'Cumulative Layout Shift',
      value: cls.value,
      rating: cls.value < 0.1 ? 'good' : cls.value < 0.25 ? 'needs-improvement' : 'poor'
    });
  }

  return metrics;
};

export const logPerformanceMetrics = (): void => {
  const metrics = measurePerformance();
  console.group('Performance Metrics');
  metrics.forEach(metric => {
    console.log(`${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
  });
  console.groupEnd();
};

export const trackImageLoadTime = (imageUrl: string): void => {
  const startTime = performance.now();
  const img = new Image();
  
  img.onload = () => {
    const loadTime = performance.now() - startTime;
    console.log(`Image load time for ${imageUrl}: ${loadTime.toFixed(2)}ms`);
  };

  img.onerror = () => {
    console.error(`Failed to load image: ${imageUrl}`);
  };

  img.src = imageUrl;
}; 