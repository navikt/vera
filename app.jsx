var React = require('react');
var Vera = require('./frontend/src/js/components/vera.jsx')

React.render(
    <Vera baseUrl='http://localhost:9080' />,
    document.getElementById('content')
);