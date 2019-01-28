import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };
    
    componentDidMount() {
        console.log("component was mounted");

        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        console.log("Getting values");

        const values = await axios.get('/api/values/current');

        console.log("     Retrieved values: " + values.data);

        this.setState({ values: values.data });
    }

    async fetchIndexes() {
      const seenIndexes = await axios.get('/api/values/all');

      this.setState({
        seenIndexes: seenIndexes.data 
      });
    }

    renderSeenIndexes() {
        // the map function below interates over all items in the array
        // sends the array value as a deconstructed value to the lambda and the lambda returns that value
        // Then calls the join function to create a string of values delimited by commas
        return this.state.seenIndexes.map(({ number }) => number).join(', ');
    }

    renderValues() {
        const entries = [];

        console.log("Rendering values")
        for (let key in this.state.values) {
            console.log("     key: " + key + "  value: " + this.state.values[key]);

            entries.push(
                <div key={key}>
                  For index {key} I calculated {this.state.values[key]}
                </div>
            );
        }

        return entries;
    }

    // This is a "bound" function
    handleSubmit = async (event) => {
        event.preventDefault();    // stop the form from submitting itself

        await axios.post('/api/values', {
          index: this.state.index   
        });

        this.setState({ index: '' });
    };

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index</label>
                    <input 
                      value={this.state.index}
                      onChange={event => this.setState({ index: event.target.value })}
                    />
                    <button>Submit</button>
                </form>

                <h3>Indexes I have seen</h3>
                { this.renderSeenIndexes() }
                <h3>Calculated Values:</h3>
                { this.renderValues() }
            </div>
        );
    }
}

export default Fib;