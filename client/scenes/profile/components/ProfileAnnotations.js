import "./ProfileAnnotations.scss";
import React from "react";
import { Link } from "react-router-dom";
import { groupBy, keys } from "lodash";
import moment from "moment";
import { ProjectSymbolBlueBox } from "../../../components";
import history from "../../../history";

export default props => {
  const groupByUri = groupBy(props.annotations, "uri");
  return (
    <div className="profile-subroute">
      {keys(groupByUri).map(uri => {
        const annotations = groupByUri[uri];
        const projectSymbol = uri.substring(22).split("/")[1];
        const path = uri.replace(window.location.origin, "");
        return (
          <div className="profile-annotation__uri">
            <ProjectSymbolBlueBox name={projectSymbol} />
            {annotations.map(annotation => (
              <div className="profile-annotation__main">
                <div className="profile-annotation__header">
                  <p>
                    {moment(annotation.createdAt).fromNow()}
                  </p>
                </div>
                <p className="profile-annotation__quote">{annotation.quote}</p>
                <p className="profile-annotation__comment">
                  {annotation.comment}
                </p>
                <div className="profile-annotation__action--bottom">
                  <a
                    className="see-in-context"
                    onClick={() =>
                      history.push(
                        `${path}/question/${
                          annotation.survey_question_id
                        }/annotation/${annotation.id}`
                      )
                    }
                  >
                    see in context
                  </a>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
