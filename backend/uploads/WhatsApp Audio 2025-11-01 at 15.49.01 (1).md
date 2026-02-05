# Mixture of Gaussian Model (MOG) / Gaussian Mixture Model (GMM)

## Summary
The Mixture of Gaussian Model (MOG), also known as Gaussian Mixture Model (GMM), is a statistical method primarily employed in computer vision for background subtraction.

## Key Points
*   It's a statistical approach.
*   Used for background subtraction in video processing.
*   Accounts for dynamic pixel changes over time caused by factors such as lighting variations, shadows, or the movement of objects.

## Important Definitions
*   **Mixture of Gaussian Model (MOG) / Gaussian Mixture Model (GMM)**: A statistical model that represents the probability distribution of observations as a weighted sum of several Gaussian distributions. In computer vision, it's applied per pixel to model its intensity variations over time.
*   **Background Subtraction**: A common technique in computer vision to segment foreground objects (e.g., moving people or vehicles) from a static or dynamic background in a video stream.

## Conclusion
The GMM/MOG provides a robust framework to model the varying characteristics of individual pixels in a video, making it effective for distinguishing between static background elements and dynamic foreground objects in challenging environments.