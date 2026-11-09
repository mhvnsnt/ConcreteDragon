using System;
using Windows.System;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Input;

namespace ConcreteDragonShell
{
    /// <summary>
    /// Full-screen host for the live Concrete Dragon web build.
    /// The game lives at GameUrl and updates on the web — this shell does not
    /// change when the game does. Controller input is handled *inside* the
    /// web build via the standard Gamepad API (see game-3d/src/main.js);
    /// the shell only adds TV-friendly framing: no chrome, no cursor UI,
    /// B/Back returns focus to the page instead of leaving the app.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        // Single source of truth for where the game is served from.
        public static readonly Uri GameUrl = new Uri("https://mhvnsnt.github.io/ConcreteDragon/");

        private bool _loaded;

        public MainPage()
        {
            InitializeComponent();
            GameView.NavigationStarting += OnNavigationStarting;
            GameView.NavigationCompleted += OnNavigationCompleted;
            GameView.NavigationFailed += OnNavigationFailed;
            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            if (_loaded) return;
            _loaded = true;
            GameView.Navigate(GameUrl);
        }

        private void OnNavigationStarting(WebView sender, WebViewNavigationStartingEventArgs args)
        {
            LoadingRing.IsActive = true;
        }

        private void OnNavigationCompleted(WebView sender, WebViewNavigationCompletedEventArgs args)
        {
            LoadingRing.IsActive = false;
            ErrorPanel.Visibility = Visibility.Collapsed;
            // Give the page focus so keyboard/gamepad-driven page handlers
            // see input without a first tap.
            GameView.Focus(FocusState.Programmatic);
        }

        private void OnNavigationFailed(object sender, WebViewNavigationFailedEventArgs e)
        {
            LoadingRing.IsActive = false;
            ErrorText.Text = "Could not load the game (" + e.WebErrorStatus + "). " +
                             "Check the console's internet connection, then retry.";
            ErrorPanel.Visibility = Visibility.Visible;
        }

        private void OnRetryClick(object sender, RoutedEventArgs e)
        {
            ErrorPanel.Visibility = Visibility.Collapsed;
            GameView.Navigate(GameUrl);
        }

        // Keep the controller's B button inside the app: WebView already uses
        // it for in-page "back" semantics via the Gamepad API, so don't let
        // the shell treat it as shell navigation.
        protected override void OnKeyDown(KeyRoutedEventArgs e)
        {
            if (e.Key == VirtualKey.GamepadB || e.Key == VirtualKey.GamepadMenu)
            {
                e.Handled = false; // let the page see it via Gamepad API polling
            }
            base.OnKeyDown(e);
        }
    }
}
