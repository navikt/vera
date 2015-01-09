var React = require('react');
var Vera = require('./frontend/src/js/components/vera.jsx')

React.render(
    <Vera restUrl='http://localhost:9080/version' />,
    document.getElementById('content')
);