/** @jsx React.DOM */

var InstanceTable = React.createClass({

    getInitialState: function () {
        return {versionData: []}
    },
    componentWillMount: function () {
        this.fetchInstances();
    },
    fetchInstances: function () {
        $.getJSON(this.props.versionsProvider).done(function (data) {
            this.setState({versionData: data})
        }.bind(this));
    },

    render: function () {
        return (
            <table className='table table-striped'>
                <thead>
                    <tr>
                        <th>application</th>
                        <th>t1</th>
                        <th>t2</th>
                    </tr>
                </thead>
                <tbody>
                {this.state.versionData.map(function (app) {
                    console.log(app)
                    return <ApplicationRow key={app.name} application={app} />
                })}
                </tbody>
            </table>
        )
    }
});

var ApplicationRow = React.createClass({
    render: function () {
        return (
            <tr>
                <td>{this.props.application.name}</td>
                {this.props.application.instances.map(function(instance){
                    return <TableDataWrapper key={instance.environment} content={instance.version} />
                })}
            </tr>
        )
    }
});

var TableDataWrapper = React.createClass({
    render: function () {
        return (
            <td>{this.props.content}</td>
        )
    }
})

React.render(
    <InstanceTable versionsProvider="http://localhost:9080/test.json" />
    , document.getElementById('content')
);