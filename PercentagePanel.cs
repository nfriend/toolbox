using System;
using System.Windows;
using System.Windows.Controls;

namespace Toolbox
{
    public class PercentagePanel : Panel
    {
        public static readonly DependencyProperty PositioningModeProperty = DependencyProperty.Register("PositioningMode", typeof(PositioningMode), typeof(PercentagePanel), new FrameworkPropertyMetadata(PositioningMode.Center, FrameworkPropertyMetadataOptions.AffectsParentArrange));
        public PositioningMode PositioningMode
        {
            get { return (PositioningMode)GetValue(PositioningModeProperty); }
            set { SetValue(PositioningModeProperty, value); }
        }

        public static readonly DependencyProperty LeftProperty = DependencyProperty.RegisterAttached("Left", typeof(Double), typeof(PercentagePanel), new FrameworkPropertyMetadata(double.MaxValue, FrameworkPropertyMetadataOptions.AffectsParentArrange));
        public static void SetLeft(UIElement element, Double value)
        {
            element.SetValue(LeftProperty, value);
        }
        public static Double GetLeft(UIElement element)
        {
            return (Double)element.GetValue(LeftProperty);
        }

        public static readonly DependencyProperty RightProperty = DependencyProperty.RegisterAttached("Right", typeof(Double), typeof(PercentagePanel), new FrameworkPropertyMetadata(double.MaxValue, FrameworkPropertyMetadataOptions.AffectsParentArrange));
        public static void SetRight(UIElement element, Double value)
        {
            element.SetValue(RightProperty, value);
        }
        public static Double GetRight(UIElement element)
        {
            return (Double)element.GetValue(RightProperty);
        }

        public static readonly DependencyProperty TopProperty = DependencyProperty.RegisterAttached("Top", typeof(Double), typeof(PercentagePanel), new FrameworkPropertyMetadata(double.MaxValue, FrameworkPropertyMetadataOptions.AffectsParentArrange));
        public static void SetTop(UIElement element, Double value)
        {
            element.SetValue(TopProperty, value);
        }
        public static Double GetTop(UIElement element)
        {
            return (Double)element.GetValue(TopProperty);
        }

        public static readonly DependencyProperty BottomProperty = DependencyProperty.RegisterAttached("Bottom", typeof(Double), typeof(PercentagePanel), new FrameworkPropertyMetadata(double.MaxValue, FrameworkPropertyMetadataOptions.AffectsParentArrange));
        public static void SetBottom(UIElement element, Double value)
        {
            element.SetValue(BottomProperty, value);
        }
        public static Double GetBottom(UIElement element)
        {
            return (Double)element.GetValue(BottomProperty);
        }

        protected override Size MeasureOverride(Size availableSize)
        {
            foreach (UIElement child in InternalChildren)
            {
                Size childSize = new Size(availableSize.Width, availableSize.Height);
                child.Measure(childSize);
            }

            return new Size()
            {
                Width = Double.IsInfinity(availableSize.Width) ? 0 : availableSize.Width,
                Height = Double.IsInfinity(availableSize.Height) ? 0 : availableSize.Height
            };
        }

        protected override Size ArrangeOverride(Size finalSize)
        {
            int currentIndex = 0;

            for (int index = InternalChildren.Count - 1; index >= 0; index--)
            {
                Rect rect = new Rect(finalSize);

                if (this.PositioningMode == PositioningMode.Center)
                {
                    double X = -1 * finalSize.Width / 2;
                    double Y = -1 * finalSize.Height / 2;

                    if (PercentagePanel.GetLeft(InternalChildren[index]) != double.MaxValue)
                    {
                        X = finalSize.Width * PercentagePanel.GetLeft(InternalChildren[index]) - finalSize.Width / 2;
                    }
                    else if (PercentagePanel.GetRight(InternalChildren[index]) != double.MaxValue)
                    {
                        X = finalSize.Width * (1.0 - PercentagePanel.GetRight(InternalChildren[index])) - finalSize.Width / 2;
                    }

                    if (PercentagePanel.GetTop(InternalChildren[index]) != double.MaxValue)
                    {
                        Y = finalSize.Height * PercentagePanel.GetTop(InternalChildren[index]) - finalSize.Height / 2;
                    }
                    else if (PercentagePanel.GetBottom(InternalChildren[index]) != double.MaxValue)
                    {
                        Y = finalSize.Height * (1.0 - PercentagePanel.GetBottom(InternalChildren[index])) - finalSize.Height / 2;
                    }

                    rect.Location = new Point()
                    {
                        X = X,
                        Y = Y
                    };
                }
                else if (this.PositioningMode == PositioningMode.Edge)
                {
                    double X = -1 * finalSize.Width / 2 + (InternalChildren[index].DesiredSize.Width / 2);
                    double Y = -1 * finalSize.Height / 2 + (InternalChildren[index].DesiredSize.Height / 2);

                    if (PercentagePanel.GetLeft(InternalChildren[index]) != double.MaxValue)
                    {
                        X = finalSize.Width * PercentagePanel.GetLeft(InternalChildren[index]) - finalSize.Width / 2 + (InternalChildren[index].DesiredSize.Width / 2);
                    }
                    else if (PercentagePanel.GetRight(InternalChildren[index]) != double.MaxValue)
                    {
                        X = finalSize.Width * (1.0 - PercentagePanel.GetRight(InternalChildren[index])) - finalSize.Width / 2 - (InternalChildren[index].DesiredSize.Width / 2);
                    }

                    if (PercentagePanel.GetTop(InternalChildren[index]) != double.MaxValue)
                    {
                        Y = finalSize.Height * PercentagePanel.GetTop(InternalChildren[index]) - finalSize.Height / 2 + (InternalChildren[index].DesiredSize.Height / 2);
                    }
                    else if (PercentagePanel.GetBottom(InternalChildren[index]) != double.MaxValue)
                    {
                        Y = finalSize.Height * (1.0 - PercentagePanel.GetBottom(InternalChildren[index])) - finalSize.Height / 2 - (InternalChildren[index].DesiredSize.Height / 2);
                    }

                    rect.Location = new Point()
                    {
                        X = X,
                        Y = Y
                    };
                }

                InternalChildren[index].Arrange(rect);
                currentIndex++;
            }

            return finalSize;
        }
    }

    public enum PositioningMode
    {
        Center, Edge
    }
}
