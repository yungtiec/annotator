import React, { Component } from "react";
import autoBind from "react-autobind";
import { withRouter } from "react-router-dom";
import Question from "./Question";
import Answers from "./Answers";
import annotator from "annotator";
import { draw, undraw } from "../../../../../../annotator/highlight";

class QnaBox extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    const self = this;
    if (!this.annotation) {
      const { qna, match, isLoggedIn, pollData, tagFilter } = this.props;
      var app = new annotator.App();
      var pageUri = function() {
        return {
          beforeAnnotationCreated: function(ann) {
            console.log(ann, self[`qna-${qna.id}`]);
            draw(self[`qna-${qna.id}`], ann);
            ann.uri = `${window.location.origin}${match.url}`;
            ann.survey_question_id = qna.id;
          },
          annotationCreated: function(ann) {
            pollData(); // add to store
          }
        };
      };
      app
        .include(annotator.ui.main, {
          element: this[`qna-${qna.id}`],
          editorExtensions: [annotator.ui.tags.editorExtension]
        })
        .include(annotator.storage.http, {
          prefix: `${window.location.origin}/api/annotator`,
          urls: {
            create: "/store",
            update: "/update/:id",
            destroy: "/delete/:id",
            search: "/search/"
          }
        })
        .include(pageUri);
      app.start().then(function() {
        console.log("starting?");
        app.annotations.load({
          uri: `${window.location.origin}${match.url}`,
          survey_question_id: qna.id
        });
      });
      this.annotator = app;
      $(".annotator-item input").attr(
        "placeholder",
        "Add some tags here (separate by space)"
      );
    }
  }

  componentDidUpdate() {
    /**
     * guest user cannot annotate
     * let's hide the annotatorjs widget
     */
    if (!this.props.isLoggedIn) {
      $(".annotator-adder").css("opacity", 0);
      $(".annotator-adder button").css("cursor", "text");
      $(".annotator-adder").css("height", "0px");
    } else {
      $(".annotator-adder").css("opacity", 1);
      $(".annotator-adder").css("cursor", "pointer");
      $(".annotator-adder").css("height", "inherit");
    }
  }

  componentWillReceiveProps(nextProps) {
    const prevProjectSymbol = this.props.match.url.split("/")[2];
    const nextProjectSymbol = nextProps.match.url.split("/")[2];
    const prevSurveyId = this.props.match.params.surveyId;
    const nextSurveyId = nextProps.match.params.surveyId;
    const prevNumAnnotations = this.props.numAnnotations;
    const nextNumAnnotations = nextProps.numAnnotations;
    const nextTags = nextProps.tagFilter.map(tag => tag.value);
    const prevTags = this.props.tagFilter.map(tag => tag.value);
    if (
      (prevProjectSymbol &&
        prevSurveyId &&
        (prevProjectSymbol !== nextProjectSymbol ||
          prevSurveyId !== nextSurveyId)) ||
      prevNumAnnotations !== nextNumAnnotations
    ) {
      // this.annotation = $(this[`qna-${this.props.qna.id}`]).annotator();
    }
  }

  render() {
    const { qna } = this.props;

    return (
      <div className="qna__container" ref={el => (this[`qna-${qna.id}`] = el)}>
        {this.props.children}
      </div>
    );
  }
}

export default withRouter(QnaBox);
