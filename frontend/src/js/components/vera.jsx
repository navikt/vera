var React = require('react');
var DeployLog = require('./deploylog.jsx');
var VersionMatrix = require('./versionmatrix.jsx');

module.exports = Vera = React.createClass({
    render: function () {
        return (
            <div>
                <nav className="navbar navbar-inverse">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <a className="navbar-brand" href="#">VERA</a>
                        </div>
                        <ul className="nav navbar-nav">
                            <li>
                                <a href="#">THE_MATRIX</a>
                            </li>
                            <li>
                                <a href="#">FIREHOSE</a>
                            </li>
                        </ul>
                    </div>
                </nav>

                <VersionMatrix restUrl={this.props.baseUrl + "/cv"} />
                <DeployLog restUrl={this.props.baseUrl + "/version"} />

            </div>
        )
    }
})






