import React, { Component, ErrorInfo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AnalyticsService } from '../services/AnalyticsService';
import { Logger } from '../utils/logger';

interface Props {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export const withErrorBoundary = (WrappedComponent: React.ComponentType<any>, options: Props = {}) => {
  return class ErrorBoundary extends Component<any, State> {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      Logger.error('Component Error:', error);
      
      AnalyticsService.getInstance().trackError(error, 'component_error');
      
      if (options.onError) {
        options.onError(error, errorInfo);
      }
    }

    handleRetry = () => {
      this.setState({ hasError: false, error: undefined });
    };

    render() {
      if (this.state.hasError) {
        if (options.fallback) {
          return options.fallback;
        }

        return (
          <View style={styles.container}>
            <Text style={styles.title}>Oops! Algo deu errado.</Text>
            <Text style={styles.message}>{this.state.error?.message}</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={this.handleRetry}
            >
              <Text style={styles.buttonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});