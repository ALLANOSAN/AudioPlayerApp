/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'src/tests/e2e/jest.config.js',
      _: ['src/tests/e2e']
    },
    jest: {
      setupTimeout: 240000,
      reportSpecs: true,
      reportWorkerAssign: true,
    },
  },
  apps: {
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'D:/Estudos/AppdeAudio/AudioPlayerApp/android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath: 'D:/Estudos/AppdeAudio/AudioPlayerApp/android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
    },
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/AudioPlayerApp.app',
      build: 'xcodebuild -workspace ios/AudioPlayerApp.xcworkspace -scheme AudioPlayerApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
  },
  devices: {
    'android.emulator': {
      type: 'android.emulator',
      device: {
        avdName: 'Android14'
      },
      forwardPort: true
    },
    'ios.simulator': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 12'
      }
    }
  },
  configurations: {
    'android.emu.debug': {
      device: 'android.emulator',
      app: 'android.debug'
    },
    'ios.sim.debug': {
      device: 'ios.simulator',
      app: 'ios.debug'
    }
  },
  behavior: {
    init: {
      exposeGlobals: true,
    },
    cleanup: {
      shutdownDevice: false,
    },
  },
  session: {
    server: 'ws://127.0.0.1:8099',
    sessionId: 'test'
  },
  artifacts: {
    rootDir: '.artifacts',
  }
};