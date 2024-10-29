# Use the official Ubuntu Jammy base image
FROM ubuntu:jammy

# Set environment variables to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update the package list and upgrade packages
RUN apt-get update && \
    apt-get upgrade -y

# Install nano, vim, nginx, python3.9, and pip
RUN apt-get install -y nano vim nginx python3.9 python3-pip ffmpeg libsm6 libxext6

# Update pip to the latest version
# RUN python3.9 -m pip install --upgrade pip

# Install Python packages with pip
RUN pip install opencv-python flask mediapipe flask_cors

# Expose port 80 for nginx
EXPOSE 80

# Expose port 5500 for flask app
EXPOSE 5500

# Start nginx service in the background and keep container running
CMD service nginx start && tail -f /dev/null


# sudo docker build -t data-analysis-image .
# sudo docker run -it -v /home/sysadm/Workspace/data-analysis/sl-data-viewer-online:/code -v /data2:/data2 -v /data3:/data3 -p 8000:80 -p 8001:5500 --shm-size 4g --cpus 1 --name data-analysis-run data-analysis-image bash