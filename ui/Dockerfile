FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-run

RUN install_packages git build-essential python

WORKDIR /usr/src

# Copies the package.json first for better cache on later pushes
COPY package.json package.json

# This install npm dependencies on the balena build server,
# making sure to clean up the artifacts it creates in order to reduce the image size.
RUN JOBS=MAX npm install --unsafe-perm && npm cache verify && rm -rf /tmp/*

# This will copy all files in our root to the working  directory in the container
COPY . ./

# run apps when container starts up on the device
# ? TODO!
CMD ["npm", "run", "dev"]
