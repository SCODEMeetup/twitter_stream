import React, { Component } from 'react';
import './App.css';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import {
  compose,
  forEachObjIndexed,
  ifElse,
  lensPath,
  of,
  view,
} from 'ramda';
import { Checkbox } from 'react-toolbox/lib/checkbox';
import { Card, CardMedia, CardText } from 'react-toolbox/lib/card';
import { CarouselProvider, Slider, Slide, Image } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

class App extends Component {
  constructor() {
    super();
    this.twitterParentRef = {};
    this.iframeTries = 0;
    this.viewPorts = [];
    this.state = {
      list: [],
      useCarousel: true,
    };
    const twitterIframePath = ['refs', 'embedContainer', 'children'];
    const getLens = ifElse(Array.isArray, lensPath, compose(lensPath, of));

    const createSelector = compose(view, getLens);
    const select = (path, state) => createSelector(path)(state);

    const twitterPoll = setInterval(() => {
      this.iframeTries += 1;
      const [iframe] = select(twitterIframePath, this.twitterParentRef) || [];
      if (iframe) {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        // const text = iframeDocument.getElementsByClassName('timeline-Tweet-text');
        const text = iframeDocument.getElementsByClassName('timeline-TweetList-tweet');
        // console.log(viewPorts);
        if (text.length > 0) {
          // viewport.style.height = 'calc(100% - 96px)';
          this.setState({ list: text });
          clearInterval(twitterPoll);
        }
      }

      if (!window.navigator.onLine) {
        console.log('cler interval');
        clearInterval(twitterPoll);
      }
    }, 500);
  }

  _renderDivs = () => {
    const divs = [];
    forEachObjIndexed((item, idx) => {
      const key = `dist ${idx}`;
      let href = 'https://pbs.twimg.com/media/D3K7-2lXcAA_irB?format=jpg&name=small';
      const texts = item.getElementsByClassName('timeline-Tweet-text');
      const media = item.getElementsByClassName('NaturalImage-image');
      if (media.length > 0) {
        href = media[0].currentSrc;
      }
      const text = texts[0].innerText;
      divs.push(
        <Slide key={key} index={idx}>
          <div className="slide">
            <Image 
              className="media"
              hasMasterSpinner
              isBgImage
              src={href}
            >
            </Image>
            <p>{text}</p>
          </div>
        </Slide>
      );
    }, this.state.list);
    console.log(divs);

    return (
      <CarouselProvider
        naturalSlideWidth={300}
        naturalSlideHeight={300}
        totalSlides={divs.length}
        visibleSlides={3}
        // hasMasterSpinner
        interval={2000}
        isPlaying
      >
        <Slider>
          {divs}
        </Slider>
      </CarouselProvider>
    );
  }

  _renderTables = () => {
    const table = [];
    let cols = [];
    let maxColumns = 3;
    let rows = 0;
    forEachObjIndexed((item, idx) => {
      const key = `dist ${idx}`;
      let href = 'https://pbs.twimg.com/media/D3K7-2lXcAA_irB?format=jpg&name=small';
      const texts = item.getElementsByClassName('timeline-Tweet-text');
      const media = item.getElementsByClassName('NaturalImage-image');
      if (media.length > 0) {
        href = media[0].currentSrc;
        console.log(href);
      }
      const text = texts[0].innerText;
      cols.push(
        <Card
          className="tweet-card"
          key={key}
          raised
        >
          {text &&
            <CardText
              className="tweet-text"
            >
              {text}
            </CardText>
          }
          {href &&
            <CardMedia
              className="media"
              aspectRatio="square"
              image={href}
            />
          }
        </Card>
      );
      rows++;
      if (rows%maxColumns === 0) {
        table.push(
          <div className="row" key={`break-${rows}`}>
            {cols}
          </div>,
        );
        cols = [];
      }
    }, this.state.list);
    return table;
  }
  render() {
    if (window.navigator.onLine) {
      return (
        <div className="App" >
        <div className="app-bar">
          <h5>Smart City Live Feed</h5>
          <Checkbox
            checked={this.state.useCarousel}
            label="Use Carousel"
            onChange={val => this.setState({ useCarousel: val})}
          />
        </div>
        { this.state.list.length > 0 && this.state.useCarousel &&
          this._renderDivs()
        }
        { this.state.list.length > 0 && !this.state.useCarousel &&
          <div className="table-wrapper">
            {this._renderTables()}
          </div>
        }
          <TwitterTimelineEmbed
            ref={ref => {
              if (ref) {
                this.twitterParentRef = ref;
              }
            }}
            sourceType="profile"
            screenName="SmartCbus"
            theme="dark"
            noHeader
            noFooter
          />
        </div>
      );
    }
    
    return null;
  }
}
  
export default App;