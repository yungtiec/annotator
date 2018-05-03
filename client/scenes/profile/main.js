import "./index.scss";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, route, Switch, Route, Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import {
  ProfileBanner,
  ProfileNavbar,
  ProfileReplies
} from "./components";
import ProfileAbout from "./scenes/about";
import ProfileAnnotations from "./scenes/annotations";
import autoBind from "react-autobind";
import moment from "moment";
import history from "../../history";

const Profile = ({ basicInfo, match }) => {
  const activeTab = window.location.pathname.split("/")[2];

  return (
    <div className="profile-container">
      <ProfileBanner
        name={`${basicInfo.first_name} ${basicInfo.last_name}`}
        numAnnotations={basicInfo.num_nnotations}
        numPageComments={basicInfo.num_page_comments}
        numIssues={basicInfo.num_issues}
        joinDate={moment(basicInfo.createdAt).format("MMM YYYY")}
      />
      <ProfileNavbar activeTab={activeTab} url={match.url} />
      <Switch>
        <Route
          path={`${match.url}/about`}
          render={props => <ProfileAbout {...basicInfo} {...props} />}
        />
        <Route path={`${match.url}/annotations`} component={ProfileAnnotations} />
        <Redirect from="/" exact to="/about" />
      </Switch>
    </div>
  );
};

const mapState = (state, ownProps) => {
  const { basicInfo } = ownProps;
  return {
    basicInfo
  };
};

export default withRouter(Profile);
