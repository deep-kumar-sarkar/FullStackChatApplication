// src/FormattedMessage.js

import React from 'react';
import ReactMarkdown from 'react-markdown';

// This component takes the raw text and renders it as formatted HTML
const FormattedMessage = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        // Customize how different elements are rendered.
        // Here, we add Tailwind CSS classes to style the output.
        h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-cyan-300" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc list-inside my-2" {...props} />,
        li: ({node, ...props}) => <li className="mb-1" {...props} />,
        p: ({node, ...props}) => <p className="mb-2" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold text-cyan-400" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default FormattedMessage;    