import React from "react";
import { keys } from "lodash";
import { Link } from "react-router-dom";
import "./ListItemGrid.scss";

export default ({
  cardHref,
  mainTitle,
  subtitle,
  textUpperRight,
  mainText,
  quote,
  tagArray,
  metadataArray
}) => {
  return (
    <div className="col-md-12">
      <Link to={cardHref}>
        <div className="entity__block list-item-grid">
          <div className="entity__header">
            <div className="d-flex flex-column entity__header-content--left">
              {quote ? (
                <div
                  className="entity__quote"
                  class="pl-3 mb-4"
                  style={{ borderLeft: "3px solid grey" }}
                >
                  <span>{quote}</span>
                </div>
              ) : null}
              <div className="entity__title">
                <span>{mainTitle}</span>
                <p className="entity-subtitle-no-margin">{subtitle}</p>
              </div>
            </div>
            <p className="entity__text-upper-right">{textUpperRight}</p>
          </div>
          <div className="entity__description">{mainText}</div>
          <div className="entity__action--bottom">
            {(tagArray &&
              tagArray.map(tag => (
                <div className="entity__metrics-stat">
                  <span>{tag}</span>
                </div>
              ))) ||
              (metadataArray &&
                metadataArray.map(metadata => (
                  <div className="entity__metadata">
                    <span>{metadata}</span>
                  </div>
                )))}
          </div>
        </div>
      </Link>
    </div>
  );
};
