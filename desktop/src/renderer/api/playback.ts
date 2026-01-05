import type { Track, PlaybackState, PlayerError } from './types';
import type { StingrayClient } from './stingrayClient';

export type PlaybackListener = (state: PlaybackState) => void;
export type ErrorListener = (error: PlayerError) => void;

export class PlaybackController {
  private audio: HTMLAudioElement | null = null;
  private state: PlaybackState = {
    isPlaying: false,
    currentTrackId: null,
    progress: 0,
    duration: 0,
    queue: [],
    currentIndex: -1
  };

  private listeners: PlaybackListener[] = [];
  private errorListeners: ErrorListener[] = [];
  private client: StingrayClient;

  constructor(client: StingrayClient) {
    this.client = client;
    this.initializeAudio();
  }

  private initializeAudio(): void {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('play', () => {
      this.state.isPlaying = true;
      this.notifyListeners();
    });

    this.audio.addEventListener('pause', () => {
      this.state.isPlaying = false;
      this.notifyListeners();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.state.progress = this.audio!.currentTime;
      this.notifyListeners();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.state.duration = this.audio!.duration;
      this.notifyListeners();
    });

    this.audio.addEventListener('ended', () => {
      this.next();
    });

    this.audio.addEventListener('error', () => {
      const error: PlayerError = {
        code: 'PLAYBACK_ERROR',
        message: 'Failed to play audio',
        retryable: true
      };
      this.notifyErrorListeners(error);
    });
  }

  async play(track: Track): Promise<void> {
    if (!this.audio) {
      throw new Error('Audio not initialized');
    }

    try {
      const url = await this.client.getStreamingUrl(track.id);
      this.audio.src = url;
      this.state.currentTrackId = track.id;
      this.state.currentIndex = this.state.queue.findIndex(t => t.id === track.id);
      await this.audio.play();
    } catch (error) {
      const playerError: PlayerError = {
        code: 'STREAM_URL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get streaming URL',
        retryable: true
      };
      this.notifyErrorListeners(playerError);
      throw playerError;
    }
  }

  async playQueue(tracks: Track[], startIndex: number = 0): Promise<void> {
    this.state.queue = tracks;
    this.state.currentIndex = startIndex;

    if (tracks.length === 0) {
      throw new Error('Queue is empty');
    }

    if (startIndex < 0 || startIndex >= tracks.length) {
      throw new Error('Invalid start index');
    }

    await this.play(tracks[startIndex]);
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  resume(): void {
    if (this.audio && !this.state.isPlaying) {
      this.audio.play().catch(err => {
        const error: PlayerError = {
          code: 'RESUME_ERROR',
          message: err instanceof Error ? err.message : 'Failed to resume playback',
          retryable: true
        };
        this.notifyErrorListeners(error);
      });
    }
  }

  togglePlayPause(): void {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  async next(): Promise<void> {
    if (this.state.currentIndex < this.state.queue.length - 1) {
      const nextIndex = this.state.currentIndex + 1;
      await this.play(this.state.queue[nextIndex]);
    } else {
      this.stop();
    }
  }

  async previous(): Promise<void> {
    if (this.state.currentIndex > 0) {
      const prevIndex = this.state.currentIndex - 1;
      await this.play(this.state.queue[prevIndex]);
    } else if (this.audio && this.audio.currentTime > 3) {
      this.seek(0);
    }
  }

  seek(progress: number): void {
    if (this.audio) {
      this.audio.currentTime = Math.max(0, Math.min(progress, this.audio.duration));
    }
  }

  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  getVolume(): number {
    return this.audio?.volume ?? 1;
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.state.currentTrackId = null;
      this.state.currentIndex = -1;
      this.notifyListeners();
    }
  }

  getState(): PlaybackState {
    return { ...this.state };
  }

  addListener(listener: PlaybackListener): void {
    this.listeners.push(listener);
  }

  removeListener(listener: PlaybackListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  addErrorListener(listener: ErrorListener): void {
    this.errorListeners.push(listener);
  }

  removeErrorListener(listener: ErrorListener): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  private notifyErrorListeners(error: PlayerError): void {
    this.errorListeners.forEach(listener => listener(error));
  }

  destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.listeners = [];
    this.errorListeners = [];
  }
}
