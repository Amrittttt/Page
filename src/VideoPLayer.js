import React from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ url }) => {
  return (
    <div className="video-player">
      <ReactPlayer url={url} controls={true} width="420px" height="250px"/>
    </div>
  );
}

export default VideoPlayer;
