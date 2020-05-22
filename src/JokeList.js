import React, { Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

const API_URL = "https://icanhazdadjoke.com/";

class JokesList extends Component {
  static defaultProps = {
    numJokestoGet: 10,
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
    };

    this.seenJokes = new Set(this.state.jokes.map((j) => j.id));
    console.log(this.seenJokes);
    this.handleVote = this.handleVote.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  //Load 10 jokes first time user loads page
  componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
  }

  //Call dad jokes API to GET jokes
  async getJokes() {
    try {
      let jokes = [];
      while (jokes.length < this.props.numJokestoGet) {
        const response = await axios.get(API_URL, {
          headers: { Accept: "application/json" },
        });
        console.log(response.data);

        //Check for duplicate jokes
        if (!this.seenJokes.has(response.data.id)) {
          jokes.push({
            text: response.data.joke,
            id: response.data.id,
            votes: 0,
          });
          this.seenJokes.add(response.data.id);
        } else {
          console.log("FOUND A DUPLICATE");
        }
      }

      this.setState(
        (st) => ({
          loading: false,
          jokes: [...st.jokes, ...jokes],
        }),
        () =>
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)) //Store votes in localStorage
      );
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  }

  //Voting functionality
  handleVote(id, delta) {
    this.setState(
      (st) => ({
        jokes: st.jokes.map((j) =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        ),
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)) //Store votes in localStorage
    );
  }

  //Get 10 more jokes
  handleClick() {
    this.setState({ loading: true }, this.getJokes);
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading...</h1>
        </div>
      );
    }

    //Sort the jokes based on vote count
    let sortedJokes = this.state.jokes.sort((a, b) => b.votes - a.votes);

    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span>Jokes
          </h1>
          <img
            alt="Laughing Emoji"
            src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
          />
          <button className="JokeList-getmore" onClick={this.handleClick}>
            New Jokes
          </button>
        </div>
        <div className="JokeList-jokes">
          {sortedJokes.map((joke) => {
            return (
              <Joke
                key={joke.id}
                text={joke.text}
                votes={joke.votes}
                upVote={() => this.handleVote(joke.id, 1)}
                downVote={() => this.handleVote(joke.id, -1)}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default JokesList;
