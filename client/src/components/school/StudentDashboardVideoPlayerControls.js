import React, { useState, forwardRef } from 'react'
import { Button, Popover } from 'reactstrap'
import Slider, { createSliderWithTooltip } from 'rc-slider'
import 'rc-slider/assets/index.css'

const SliderWithTooltip = createSliderWithTooltip(Slider)

const VideoPlayerControls = ({ 
     courseunit,
     onPlayPause,
     playing,
     onRewind,
     onFastForward,
     muted,
     onMute,
     volume,
     onVolumeChange,
     onVolumeSeekUp,
     playbackRate,
     onPlaybackRateChange,
     onToggleFullScreen,
     played,
     onSeek,
     onSeekMouseDown,
     onSeekMouseUp,
     elaspedTime,
     totalDuration,
     onChangeDisplayFormat,
    }, ref) => {

    const [ popoverDisplay, setPopoverDisplay ] = useState(false)
    const togglePopover = () => setPopoverDisplay(!popoverDisplay)

    return <>
         <div className="video-player__controls-wrapper" ref={ref}>
                {/* top controls  */}
                <div className="video-info">
                 <h5>{courseunit.name}</h5>
                </div>

                {/* middle controls  */}
                <div className="video-player__middle-controls">
                    <div onClick={onRewind} className="player-controls-icon">
                        <i className="fas fa-backward"></i>
                    </div>
                    <div onClick={onPlayPause} className="player-controls-icon">
                        {
                            playing ? (<i className="fas fa-pause"></i>) : (<i className="fas fa-play"></i>)
                        }
                    </div>
                    <div onClick={onFastForward} className="player-controls-icon">
                        <i className="fas fa-forward"></i>
                    </div>
                </div>

                {/* bottom controls  */}
            <div className="video-player__bottom-controls">
             <div className="video-player__slider">
                        <SliderWithTooltip
                         trackStyle={{ backgroundColor: '#242121', height:6 }}
                         railStyle={{ backgroundColor: '#fff', height:6 }}
                         value={played * 100}
                         min={0}
                         max={100}
                        tipFormatter={v => `${elaspedTime}`}
                        tipProps={{ overlayClassName: 'foo' }}
                        handleStyle={{
                            borderColor: '#242121',
                            height:17,
                            width: 17,
                            backgroundColor: '#fff',
                          }}
                        onChange={onSeek}
                        onAfterChange={onSeekMouseDown}
                        onBeforeChange={onSeekMouseUp}
                        />
                 </div>
                <div className="bottom-controls">
                    <div onClick={onPlayPause} className="video-player__bottom-controls-play-icon ml-3">
                          {
                              playing ? (<i className="fas fa-pause"></i>) : (<i className="fas fa-play"></i>)
                          }
                    </div>
                    <div onClick={onMute} className="video-player__bottom-controls-volume-icon ml-2">
                        {
                            muted ? (<i className="fas fa-volume-mute"></i>) : (<i className="fas fa-volume-up"></i>)
                        }
                    </div>
                    <div className="video-player__volume-slider">
                    <SliderWithTooltip
                         trackStyle={{ backgroundColor: '#242121', height:4 }}
                         railStyle={{ backgroundColor: '#fff', height:4 }}
                         value={volume * 100}
                         min={0}
                         max={100}
                        tipFormatter={v => `${v} %`}
                        tipProps={{ overlayClassName: 'foo' }}
                        handleStyle={{
                            borderColor: '#242121',
                            height:12.5,
                            width: 12.5,
                            backgroundColor: '#242121',
                          }}
                        onChange={onVolumeChange}
                        onAfterChange={onVolumeSeekUp}
                        />
                    </div>
                    <div onClick={onChangeDisplayFormat} className="video-player__playback-time">
                        {elaspedTime} / {totalDuration}
                    </div>
                    <div className="video-player__playback-rate">
                  <button
                    className="video-player__playback-rate-btn"
                    id="popoverplaybackrate"
                    type="button"
                     >
                    {playbackRate}x
                 </button>
                 <Popover 
                    placement='bottom'
                    isOpen={popoverDisplay}
                    target="popoverplaybackrate"
                    toggle={togglePopover}
                 >
                  {
                    [0.5, 1, 1.5, 2].map((rate) => (<Button 
                        key={rate}
                        onClick={() => onPlaybackRateChange(rate)} 
                        className={`playback-rate__btn-item ${rate === playbackRate && 'active'}`}>{rate}
                        </Button>))
                  } 
                 </Popover>
                 </div>
                    <div onClick={onToggleFullScreen} className="video-player__fullscreen">
                    <i className="fas fa-expand"></i>
                    </div>
                 </div>
                </div>
            </div>
    </>
}

export default forwardRef(VideoPlayerControls)