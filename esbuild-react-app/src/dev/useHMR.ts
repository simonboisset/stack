import { useEffect } from 'react';

const useHMR = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      new EventSource('http://localhost:5010/esbuild').onmessage = () => window.location.reload();
    }
  }, []);
};
export default useHMR;
