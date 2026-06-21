import React from 'react';

interface DataDebuggerProps {
  data: any[];
  title: string;
}

const DataDebugger: React.FC<DataDebuggerProps> = ({ data, title }) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  const analyzeData = () => {
    if (!Array.isArray(data)) {
      return {
        summary: { total: 0, valid: 0, empty: 0, invalid: 0 },
        details: []
      };
    }
    
    const analysis = data.map((row, index) => {
      if (!row || typeof row !== 'object') {
        return { index, type: 'invalid', reason: 'Not an object', data: row };
      }
      
      const fields = Object.keys(row);
      const emptyFields = fields.filter(key => {
        const value = row[key];
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed === '' || trimmed === 'null' || trimmed === 'undefined' || /^\s*$/.test(trimmed);
        }
        return false;
      });
      
      const nonEmptyFields = fields.filter(key => !emptyFields.includes(key));
      
      return {
        index,
        type: nonEmptyFields.length === 0 ? 'empty' : 'valid',
        totalFields: fields.length,
        emptyFields: emptyFields.length,
        nonEmptyFields: nonEmptyFields.length,
        sampleData: Object.fromEntries(
          nonEmptyFields.slice(0, 3).map(key => [key, row[key]])
        )
      };
    });
    
    const summary = {
      total: data.length,
      valid: analysis.filter(a => a.type === 'valid').length,
      empty: analysis.filter(a => a.type === 'empty').length,
      invalid: analysis.filter(a => a.type === 'invalid').length
    };
    
    return { summary, details: analysis };
  };
  
  const { summary, details } = analyzeData();
  
  return (
    <div style={{ margin: '10px', padding: '10px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
      <h4>{title} - Data Analysis</h4>
      <div>
        <strong>Summary:</strong> Total: {summary.total}, Valid: {summary.valid}, Empty: {summary.empty}, Invalid: {summary.invalid}
      </div>
      {summary.empty > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Empty rows found:</strong>
          {details.filter(d => d.type === 'empty').slice(0, 5).map(detail => (
            <div key={detail.index} style={{ fontSize: '12px', margin: '2px 0' }}>
              Row {detail.index}: {detail.totalFields} fields, all empty
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataDebugger;
