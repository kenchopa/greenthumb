import React, { useEffect, useState } from 'react';

import { getUserBoard } from '../../services/user.service';
import EventBus from '../../utils/event-bus.util';

const BoardUser: React.FC = () => {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    getUserBoard().then(
      (response) => {
        setContent(response.data);
      },
      (error) => {
        const con =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setContent(con);

        if (error.response && error.response.status === 401) {
          EventBus.dispatch('logout');
        }
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

export default BoardUser;
