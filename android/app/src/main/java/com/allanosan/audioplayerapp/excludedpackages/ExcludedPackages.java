package com.allanosan.AudioPlayerApp.excludedpackages;

import java.util.Arrays;
import java.util.List;

public class ExcludedPackages {
    public static List<String> getExcludedPackages() {
        return Arrays.asList(
            "com.amplitude.reactnative.AmplitudeReactNativePackage"
        );
    }
}