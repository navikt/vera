var React = require('react');

var LogRow = require('./logrow.jsx')

module.exports = DeployLog = React.createClass({

    getInitialState: function(){
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

        var nonMatchingEvents = function(elem){
            var application = elem.application.toLowerCase();
            var environment = elem.environment.toLowerCase();
            return application.indexOf(filterString) > -1 && environment.indexOf(filterString2) > -1;
        }

        return <table className='table table-striped'>
            <tr>
                <th><input type="text" value={this.state.filterString} onChange={this.handleChange} /></th>
                <th><input type="text" value={this.state.filterString2} onChange={this.handleChange2} /></th>
                <th>deployer</th>
                <th>version</th>
            </tr>
            <tbody>
                    {this.props.items
                        .filter(nonMatchingEvents)
                        .map(function(elem){
                            //TODO returnere en id på hvert element fra REST-tjenesten?
                            return <LogRow key={elem.environment + elem.application + elem.version} event={elem} />
                        })}
            </tbody>
        </table>
    }
});

