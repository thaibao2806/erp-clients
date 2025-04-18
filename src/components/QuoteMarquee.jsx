import React, { useState, useEffect } from 'react';
import quotes from '../data/quotes'; // import file quotes
import { Typography } from 'antd';

const { Text } = Typography;

const QuoteMarquee = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [animateKey, setAnimateKey] = useState(0); // Key để reset animation

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
      setAnimateKey((prev) => prev + 1); // Reset animation
    }, 50000); // 20s đổi câu

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      width: '100%',
      marginRight:30
      //background: '#0077cc',
      //padding: '8px 0'
    }}>
      <div
        key={animateKey}
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          animation: 'marquee 20s linear infinite',
          fontSize: 18,
          fontWeight: 'bold',
          //color: '#ffffff',
          paddingLeft: '100%', // bắt đầu ngoài màn hình bên phải
        }}
      >
        <div>
         “{quotes[currentQuoteIndex].content}” — <span style={{ fontStyle: 'italic', color: 'gray' }}>{quotes[currentQuoteIndex].author}</span>
         </div>
      </div>

      {/* CSS animation nội bộ */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default QuoteMarquee;
