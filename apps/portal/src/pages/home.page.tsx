import React, { useEffect, useState } from 'react';

import { getPublicContent } from '../services/user.service';

const Home: React.FC = () => {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    getPublicContent().then(
      (response) => {
        setContent(response.data);
      },
      (error) => {
        const cont =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();

        setContent(cont);
      },
    );
  }, []);

  return (
    <div className="container">
      <header className="jumbotron">
        <h3>{content}</h3>
      </header>
    </div>
  );
};

export default Home;
