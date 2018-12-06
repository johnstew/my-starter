import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
// import FormHelperText from '@material-ui/core/FormHelperText';

const styles = {
  formGroupRow: {
    flexFlow: 'row wrap',
    alignItems: 'baseline',
    marginTop: 20
  },
  formGroupInputs: {
    marginLeft: 10
  },
  booleanFieldValue: {
    width: 150
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.handleAddFieldClick = this.handleAddFieldClick.bind(this);
    this.handleFieldTypeChange = this.handleFieldTypeChange.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.orderCounter = 0;
  }

  state = {
    fields: {},
    showFieldSelect: false,
    fieldTypeValue: '',
    fieldNameValue: '',
    fieldValue: null,
    documentPath: null
  };

  handleAddFieldClick(fk) {
    this.setState({ showFieldSelect: true, documentPath: fk });
  }

  handleFieldTypeChange(e) {
    this.setState({ fieldTypeValue: e.target.value, showFieldSelect: false });
  }

  handleInputChange(type, value) {
    this.setState({ [type]: value });
  }

  handleSaveClick() {
    const { fieldTypeValue, fieldNameValue, fieldValue, fields, documentPath } = this.state;

    let value = null;

    if (fieldTypeValue === 'object') {
      value = {};
    } else if (fieldTypeValue === 'number') {
      value = Number(fieldValue);
    } else if (fieldTypeValue === 'array') {
      value = [];
    } else {
      value = fieldValue;
    }

    let updatedFields = {};

    if (!documentPath) {
      updatedFields = Object.assign({}, fields, {
        [fieldNameValue]: value
      });
    } else {
      updatedFields = App.findAndUpdate(fields, documentPath, fieldNameValue, value);
    }

    this.setState({
      fields: updatedFields,
      fieldTypeValue: '',
      fieldNameValue: '',
      fieldValue: null,
      documentPath: null
    });

    this.orderCounter++;
  }

  static findAndUpdate(thing, path, name, value) {
    function traverse(thing, keys) {
      const tKeys = keys.join('.');

      if (Array.isArray(thing)) {
        if (tKeys === path) {
          thing = [...thing, value];
        }

        return thing.map(t => traverse(t, keys));
      } else if (thing !== null && typeof thing === 'object') {
        if (tKeys === path) {
          console.log(thing);
          thing = Object.assign({}, thing, {
            [name]: value
          });
        }

        return Object.keys(thing).reduce((newThing, key) => {
          newThing[key] = traverse(thing[key], keys.concat(key));
          return newThing;
        }, {});
      } else {
        return thing;
      }
    }

    return traverse(thing, []);
  }

  renderFieldTypeSelect() {
    const { showFieldSelect } = this.state;

    if (!showFieldSelect) {
      return <span />;
    }

    return (
      <div className="field-type">
        <FormControl variant="outlined" fullWidth>
          <InputLabel htmlFor="field-type">Field Type</InputLabel>
          <Select
            value={this.state.fieldTypeValue}
            onChange={this.handleFieldTypeChange}
            input={<OutlinedInput labelWidth={75} name="field-type" id="field-type" />}
          >
            <MenuItem value="string">Text</MenuItem>
            <MenuItem value="number">Number</MenuItem>
            <MenuItem value="object">Document</MenuItem>
            <MenuItem value="array">List</MenuItem>
            <MenuItem value="boolean">True/False</MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  }

  renderFieldInput() {
    const { fieldTypeValue } = this.state;
    const { classes } = this.props;

    if (!fieldTypeValue) {
      return <span />;
    }

    return (
      <div className="field-input">
        <FormGroup row className={classes.formGroupRow}>
          <FormControl variant="outlined">
            <TextField
              required
              label="Name"
              margin="normal"
              variant="outlined"
              value={this.state.fieldNameValue}
              onChange={e => this.handleInputChange('fieldNameValue', e.target.value)}
            />
          </FormControl>
          {this.renderFieldInputControl()}
          <FormControl variant="outlined" className={classes.formGroupInputs}>
            <TextField
              label="Path"
              margin="normal"
              variant="outlined"
              value={this.state.documentPath || ''}
              onChange={e => this.handleInputChange('documentPath', e.target.value)}
            />
          </FormControl>
          <FormControl variant="outlined" disabled className={classes.formGroupInputs}>
            <InputLabel htmlFor="field-type">Field Type</InputLabel>
            <Select
              value={this.state.fieldTypeValue}
              onChange={this.handleFieldTypeChange}
              input={<OutlinedInput labelWidth={75} name="field-type" id="field-type" />}
            >
              <MenuItem value="string">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="object">Document</MenuItem>
              <MenuItem value="array">List</MenuItem>
              <MenuItem value="boolean">True/False</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" color="primary" onClick={this.handleSaveClick} className={classes.formGroupInputs}>
            Save
          </Button>
        </FormGroup>
      </div>
    );
  }

  renderFieldInputControl() {
    const { fieldTypeValue } = this.state;
    const { classes } = this.props;

    if (fieldTypeValue === 'string' || fieldTypeValue === 'number') {
      return (
        <FormControl variant="outlined" className={classes.formGroupInputs}>
          <TextField
            required
            label="Value"
            margin="normal"
            variant="outlined"
            value={this.state.fieldValue || ''}
            onChange={e => this.handleInputChange('fieldValue', e.target.value)}
          />
        </FormControl>
      );
    } else if (fieldTypeValue === 'boolean') {
      return (
        <FormControl variant="outlined" className={classes.formGroupInputs} required>
          <InputLabel htmlFor="boolean-field-value">Value</InputLabel>
          <Select
            displayEmpty
            className={classes.booleanFieldValue}
            value={this.state.fieldValue || ''}
            onChange={e => this.handleInputChange('fieldValue', e.target.value)}
            input={<OutlinedInput labelWidth={50} name="boolean-field-value" id="boolean-field-value" />}
          >
            <MenuItem value="true">True</MenuItem>
            <MenuItem value="false">False</MenuItem>
          </Select>
        </FormControl>
      );
    }
  }

  renderCurrentTree() {
    const { fields } = this.state;

    if (JSON.stringify(fields) === JSON.stringify({})) {
      return <span />;
    }

    return (
      <Paper style={{ padding: 20, marginTop: 20 }}>
        <pre style={{ background: '#dcdcdc', color: '#000000', padding: 20, borderRadius: 5 }}>
          {JSON.stringify(fields, null, 4)}
        </pre>
      </Paper>
    );
  }

  render() {
    return (
      <div>
        <h1>Create Document</h1>
        <Button variant="contained" color="primary" onClick={() => this.handleAddFieldClick()}>
          Add Field
        </Button>
        {this.renderFieldTypeSelect()}
        {this.renderFieldInput()}
        {this.renderCurrentTree()}
      </div>
    );
  }
}

export default withStyles(styles)(App);
