// Create web server using express
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Parse application/json
app.use(bodyParser.json());

// Create comments object
const commentsByPostId = {};

// Create function to handle event
const handleEvent = (type, data) => {
  if (type === 'CommentCreated') {
    // Create commentId
    const { id, content, postId, status } = data;
    const comments = commentsByPostId[postId] || [];

    // Push data to object
    comments.push({ id, content, status });
    commentsByPostId[postId] = comments;
  }

  if (type === 'CommentUpdated') {
    // Get data from event
    const { id, content, postId, status } = data;

    // Get comments from object
    const comments = commentsByPostId[postId];

    // Find comment that need to update
    const comment = comments.find((comment) => {
      return comment.id === id;
    });

    // Update comment's content
    comment.content = content;
    comment.status = status;
  }
};

// Create endpoint to handle event
app.post('/events', (req, res) => {
  // Get data from event
  const { type, data } = req.body;

  // Handle event
  handleEvent(type, data);

  // Send response
  res.send({});
});

// Create endpoint to get comments by postId
app.get('/posts/:id/comments', (req, res) => {
  // Get postId from request
  const { id } = req.params;

  // Get comments from object
  const comments = commentsByPostId[id] || [];

  // Send response
  res.send(comments);
});

// Create web server
app.listen(4001, async () => {
  console.log('Listening on port 4001');

  // Get events from event bus
  const res = await axios.get('http://event-bus-srv:4005/events');

  // Get data from response
  for (let event of res.data) {
    console.log('Processing event:', event.type);
    handleEvent(event.type, event.data);
  }
});
 
 