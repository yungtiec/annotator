import React, { Component } from "react";
import autoBind from "react-autobind";
import CommentBox from "./CommentBox";
import Select from "react-select";
import { TagChip } from "../../../../../../components";

export default class CommentBoxWithTagField extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      tags: this.props.tags,
      selectedTags: this.props.selectedTags,
      issueOpen: this.props.issueOpen
    };
  }

  handleTagOnChange(selected) {
    selected = selected[0].name
      ? selected[0]
      : { ...selected[0], name: selected[0].value };
    if (
      this.state.selectedTags.map(tag => tag.name).indexOf(selected.value) ===
      -1
    ) {
      this.setState(prevState => ({
        selectedTags: [...prevState.selectedTags, selected]
      }));
    }
  }

  handleIssueCheckboxChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      issueOpen: value
    });
  }

  handleRemoveTag(index) {
    this.setState({
      selectedTags: this.state.selectedTags.filter((tag, i) => i !== index)
    });
  }

  handleSubmitEditedCommentAndTag(argObj) {
    const { onSubmit } = this.props;
    const newArgObj = {
      ...argObj,
      tags: this.state.selectedTags,
      issueOpen: this.state.issueOpen,
      versionId: this.props.versionId
    };
    onSubmit(newArgObj);
    this.setState({
      selectedTags: [],
      issueOpen: false
    });
  }

  render() {
    const {
      onSubmit,
      tags,
      showTags,
      showIssueCheckbox,
      ...otherProps
    } = this.props;
    return (
      <div>
        <CommentBox
          {...otherProps}
          onSubmit={this.handleSubmitEditedCommentAndTag}
        />
      </div>
    );
  }
}
