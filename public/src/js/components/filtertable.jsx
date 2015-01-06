var React = require('react');
var _ = require('lodash');

module.exports = React.createClass({

    getInitialState: function(){
        var keys = _.keys(this.props.items[0]);
        console.log("Got the following keys: " + keys);

        return { filterString: '', filterString2: '' };
    },

    handleChange: function(e){
        this.setState({ filterString: e.target.value });
    },

    handleChange2: function(e){
        this.setState({ filterString2: e.target.value });
    },

    render: function(){
        var filterString  = this.state.filterString.trim().toLowerCase();
        var filterString2  = this.state.filterString2.trim().toLowerCase();

        return <table>
            <tr>
                <th><input type="text" value={this.state.filterString} onChange={this.handleChange} /></th>
                <th><input type="text" value={this.state.filterString2} onChange={this.handleChange2} /></th>
            </tr>
            <tbody>
                    {this.props.items
                        .filter(function(elem){
                            return elem.app.indexOf(filterString) > -1 && elem.env.indexOf(filterString2) > -1;
                        })
                        .map(function(elem){
                            return <tr><td>{elem.app}</td><td>{elem.env}</td></tr>
                        })}
            </tbody>
        </table>
    }
});

