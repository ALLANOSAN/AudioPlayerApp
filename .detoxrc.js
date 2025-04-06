/** @type {Detox.DetoxConfig} */
module.exports = {
    testRunner: {
      args: {
        $0: 'jest',
        config: 'src/tests/e2e/jest.config.js',
        _: ['src/tests/e2e']
      },
      jest: {
        setupTimeout: 120000,
        reportSpecs: true,
        reportWorkerAssign: true,
      },
    },
    apps: {
      'android.debug': {
        type: 'android.apk',
        binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
        build: 'cd android && gradlew.bat assembleDebug assembleAndroidTest -DtestBuildType=debug',
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
          avdName: 'Pixel_3a_API_30_x86'
        }
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
    }
  };  