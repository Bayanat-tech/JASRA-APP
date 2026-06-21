import { RedoOutlined } from '@ant-design/icons';
import { Alert, Button, Card, CardContent } from '@mui/material';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

// const current_environment = process.env.CURR_ENVIRONMENT;

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMessage: _.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    return { hasError: true, errorMessage: error.stack };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardContent color="red" className="flex items-center justify-between">
            <Alert
              className="w-full"
              severity="error"
              action={
                <Button onClick={() => window.location.reload()} variant="text" startIcon={<RedoOutlined className="-rotate-45" />}>
                  Reload
                </Button>
              }
            >
              Something went wrong
            </Alert>

            {/* <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <WarningOutlined className="mb-[0.1rem] tex" />
              <Typography color="red" variant="body1">
                {current_environment === 'DEV' ? this.state.errorMessage : 'Something went wrong.'}
              </Typography>
            </Stack> */}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
