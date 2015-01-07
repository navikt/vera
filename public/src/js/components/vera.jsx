var React = require('react');
var $ = require('jquery');
var DeployLog = require('./deploylog.jsx');

module.exports = Vera = React.createClass({

    getInitialState: function(){
        return {items: []}
    },

    componentDidMount: function(){
        $.getJSON(this.props.restUrl).done(function (data) {
            this.setState({items: data})
        }.bind(this));
    },

    render: function() {
        return (
            <DeployLog items={this.state.items} />
        )
    }
})






