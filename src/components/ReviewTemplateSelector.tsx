'use client';

import React, { useState, useEffect } from 'react';

interface ReviewTemplate {
  id: string;
  name: string;
  templateData: any; // Define a more specific type if needed
}

const ReviewTemplateSelector: React.FC<{ onTemplateSelect: (templateData: any) => void }> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        // Fetch templates from a JSON file or a directory
        const res = await fetch('/templates/templates.json'); // Assuming templates are in public/templates
        if (!res.ok) {
          throw new Error('Failed to fetch review templates');
        }
        const data: ReviewTemplate[] = await res.json();
        setTemplates(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = event.target.value;
    const selectedTemplate = templates.find(template => template.id === templateId);
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate.templateData);
    }
  };

  if (loading) {
    return <p>Loading templates...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <label htmlFor="templateSelector" className="block text-gray-700 text-sm font-bold mb-2">Review Template:</label>
      <select
        id="templateSelector"
        onChange={handleTemplateChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option value="">Select a template</option>
        {templates.map(template => (
          <option key={template.id} value={template.id}>{template.name}</option>
        ))}
      </select>
    </div>
  );
};

export default ReviewTemplateSelector;
