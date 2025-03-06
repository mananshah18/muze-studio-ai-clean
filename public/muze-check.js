// This is a simple script to check if the Muze library is accessible
console.log('Muze check script loaded');

// Try to load the Muze library
function checkMuze() {
  console.log('Checking for Muze library...');
  
  if (typeof muze !== 'undefined') {
    console.log('Muze is already defined!', muze);
    return;
  }
  
  const paths = [
    '/muze.js',
    './muze.js',
    '/lib/muze.js',
    './lib/muze.js',
    '../lib/muze.js',
    'lib/muze.js',
    '/assets/muze.js',
    './assets/muze.js'
  ];
  
  paths.forEach(path => {
    const script = document.createElement('script');
    script.src = path;
    script.onload = () => {
      console.log(`Script loaded from ${path}`);
      if (typeof muze !== 'undefined') {
        console.log(`Muze loaded successfully from ${path}!`, muze);
      } else {
        console.log(`Script loaded from ${path} but muze is undefined`);
      }
    };
    script.onerror = () => {
      console.error(`Failed to load script from ${path}`);
    };
    document.head.appendChild(script);
  });
}

// Export the check function
window.checkMuze = checkMuze;

// Run the check automatically
setTimeout(checkMuze, 1000); 