var React = require('react');
var Vera = require('./public/src/js/components/vera.jsx')

React.render(
    <Vera restUrl='http://localhost:9080/event' />,
    document.getElementById('content')
);