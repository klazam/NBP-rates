import React, { PureComponent } from 'react';
import RestService from './RestService';
import moment from 'moment';
import './App.css';

class App extends PureComponent {
  state = {
    elements: [],
  }

  fetchData = async () => {
    const { valToSearch, elements: oldElements, value, date } = this.state;

    const { rates } = await RestService.get(`exchangerates/rates/A/EUR/${valToSearch}/`);

    const elements = [
      ...oldElements,
      {
        date,
        value,
        valToSearch,
        rate: rates[0].mid,
        no: rates[0].no,
        summary: Math.round(value * rates[0].mid * 100) / 100,
      }
    ]

    this.setState({ elements });
  }

  handleChange = (event) => {
    const { target: { value, name } } = event;

    if (name === 'date') {
      let valToSearch;
      const date = moment(value);

      if (date.day() === 1) {
        valToSearch = date.subtract(3, 'days');
      } else if (date.day() === 0) {
        valToSearch = date.subtract(2, 'days');
      } else {
        valToSearch = date.subtract(1, 'days');
      }
      valToSearch = valToSearch.format('YYYY-MM-DD');
      this.setState({ [name]: value, valToSearch });
      return;
    }

    this.setState({ [name]: value });
  }

  getSummary = () => {
    const { elements } = this.state;

    return Math.round(elements.reduce((prev, curr) => prev + curr.summary, 0) * 100) / 100;
  }

  handleDelete = (element) => {
    const { elements: oldElements } = this.state;

    const elements = [...oldElements];

    const index = elements.findIndex(el => el === element);

    elements.splice(index, 1);

    this.setState({ elements });
  }

  render() {
    const { date, value, elements } = this.state;
    return (
      <div className="App">
        <input name="date" type="date" placeholder="data" value={date} onChange={this.handleChange} />
        <input name="value" placeholder="wartosc w euro" onChange={this.handleChange} value={value} />
        <button onClick={this.fetchData}>Szukaj</button>
        <table>
          <thead>
            <th>#</th>
            <th>Data</th>
            <th>Wartosc w Euro</th>
            <th>Nr. tabeli NBP</th>
            <th>Z dnia</th>
            <th>Kurs Euro</th>
            <th>Wartosc w pln</th>
          </thead>
          <tbody>
            {elements.map((element, index) => {
              const del = () => this.handleDelete(element);

              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{element.date}</td>
                  <td>{element.value}</td>
                  <td>{element.no}</td>
                  <td>{element.valToSearch}</td>
                  <td>{element.rate}</td>
                  <td>{element.summary}</td>
                  <td><button onClick={del}>USUN</button></td>
                </tr>
              );
            })}
            <tr>
              <td />
              <td />
              <td />
              <td />
              <td />
              <td />
              <td>{this.getSummary()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
