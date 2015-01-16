var React = require('react');

var $ = require('jquery');
var LogRow = require('./logrow.jsx');
var Router = require('react-router');
var Select = require('react-select');

module.exports = DeployLog = React.createClass({

    mixins: [Router.State],

    getInitialState: function () {
        return {
            items: [],
            applicationFilter: '',
            environmentFilter: '',
            deployerFilter: '',
            versionFilter: '',
            timestampFilter: ''
        };
    },

    handleChange: function (e) {
        this.state[e.target.id] = e.target.value
        this.setState(this.state);
    },

    componentDidMount: function () {
        var queryParams = [];
        if (this.getQuery().app) {
            queryParams.push("app=" + this.getQuery().app);
            this.state.applicationFilter = this.getQuery().app;
        }

        if (this.getQuery().env) {
            queryParams.push("env=" + this.getQuery().env);
            this.state.environmentFilter = this.getQuery().env;
        }

        var url = 'http://localhost:9080/version?' + queryParams.join("&");
        console.log("url", url);
        $.getJSON(url).done(function (data) {
            console.log("got data:" + data.length);
            this.setState({items: data})
            console.log(data);
        }.bind(this));
    },

    render: function () {

        var options = [
            {value: 'one', label: 'One'},
            {value: 'two', label: 'Two'}
        ];

        var applicationFilter = this.state.applicationFilter.toLowerCase();
        var environmentFilter = this.state.environmentFilter.toLowerCase();
        var deployerFilter = this.state.deployerFilter.toLowerCase();
        var versionFilter = this.state.versionFilter.toLowerCase();
        var timestampFilter = this.state.timestampFilter.toLowerCase();

        var nonMatchingEvents = function (elem) {
            var application = elem.application;
            var environment = elem.environment;
            var deployer = elem.deployer;
            var version = elem.version;
            var timestamp = elem.timestamp;

            return application.indexOf(applicationFilter) > -1
                && environment.indexOf(environmentFilter) > -1
                && deployer.indexOf(deployerFilter) > -1
                && version.indexOf(versionFilter) > -1
                && timestamp.toString().indexOf(timestampFilter) > -1;
        }

        return (
            <div>

                <div><h2>Events ({this.state.items.filter(nonMatchingEvents).length + "/" + this.state.items.length})</h2>
                    <div className="pull-right col-xs-3">
                        <TimeSpanSelector />
                    </div>
                </div>

                <table className='table table-striped'>
                    <tr>
                        <th>
                            <input id="applicationFilter" placeholder="Application" value={this.state.applicationFilter} type="text" onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="environmentFilter" placeholder="Environment" value={this.state.environmentFilter} type="text" onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="deployerFilter" placeholder="Deployer" type="text" onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="versionFilter" placeholder="Version" type="text" onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="timestampFilter" placeholder="Timestamp" type="text" onChange={this.handleChange} />
                        </th>
                    </tr>
                    <tbody>
                        {this.state.items
                            .filter(nonMatchingEvents)
                            .map(function (elem) {
                                return <LogRow key={elem._id} event={elem} />
                            })}
                    </tbody>
                </table>
            </div>
        )
    }
});

var TimeSpanSelector = React.createClass({
    getInitialState: function () {
        return {
            selectValue: ''
        }
    },
    updateValue: function (newValue) {
        this.setState({
            selectValue: newValue || null
        });
    },
    render: function () {
        var ops = [
            {label: 'aaaaaaaaaaaaaaaaaaaaaaa', value: 'a'},
            {label: 'bbbbbbbbbbbbbbbbbbbbbbb', value: 'b'}
        ];

        return (
            <Select options={ops} value={this.state.selectValue} onChange={this.updateValue} />
        );
    }
});


