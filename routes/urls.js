const path = require('path');

module.exports = (app) => {
  app.get('/', (req, res) => { 
    res.sendFile(path.join(__dirname, '../', 'public', 'home.html')); 
  });
  
  app.get('/home', (req, res) => { 
    res.sendFile(path.join(__dirname, '../', 'public', 'about.html')); 
  });

  app.get('/dashboard', (req, res) => { 
    res.sendFile(path.join(__dirname, '../', 'public', 'dashboard', 'student', 'student-dash.html')); 
  });

  app.get('/exp/loading', (req, res) => { 
    res.sendFile(path.join(__dirname, '../', 'public', 'experimental', 'loading.html')); 
  });

  app.get('/exp/noti', (req, res) => { 
    res.sendFile(path.join(__dirname, '../', 'public', 'experimental', 'notification.html')); 
  });

  app.get('/exp/toast', (req, res) => { 
    res.sendFile(path.join(__dirname, '../', 'public', 'experimental', 'toast.html')); 
  });

  app.get('/api', (req, res) => { 
    res.sendFile(path.join(__dirname, '../', 'public', 'apicall.html')); 
  });

  app.get('/onboarding', (req, res) => { 
    res.sendFile(path.join(__dirname, '../', 'public', 'onboarding', 'onboarding.html')); 
  });

  app.get('/login', (req, res) => { 
    res.sendFile(path.join(__dirname, '../', 'public', 'login.html')); 
  });

  app.get('/staff/dashboard', (req, res) => { 
    res.sendFile(path.join(__dirname, '../', 'public', 'dashboard', 'dashboard.html')); 
  });

  app.use((req, res) => { 
    res.status(404).sendFile(path.join(__dirname, '../', 'public', '404.html')); 
  });
};