---
author: Ankit Sahu
pubDatetime: 2026-07-05T00:00:00Z
title: Installing Citrix Workspace on Ubuntu 26.04 (A Troubleshooting Guide)
postSlug: citrix-workspace-ubuntu-26-installation-troubleshoot
featured: true
draft: false
tags:
  - ubuntu
  - linux
  - citrix
  - troubleshooting
description: A troubleshooting guide for installing Citrix Workspace on Ubuntu 26.04 and fixing missing libxml2, libsoup, libmanette, and ICU compatibility libraries.
---

Installing proprietary software on a bleeding-edge Linux distribution is always an adventure.

I recently installed Ubuntu 26.04 on my workstation and needed Citrix Workspace for work. The installation itself looked straightforward: download the `.deb` package and install it.

Unfortunately, Citrix Workspace expected some libraries that were no longer available by default on Ubuntu 26.04.

What followed was a series of missing dependencies, incompatible library versions, and a bit of Linux troubleshooting.

This guide documents the complete process that worked for me.

## Installing Citrix Workspace

I downloaded the 64-bit `.deb` package for Citrix Workspace.

In my case, the downloaded package was:

```bash
icaclient-gcc-8_26.04.0.105_amd64.deb
```

Initially, I installed it using:

```bash
sudo dpkg -i icaclient-gcc-8_26.04.0.105_amd64.deb
```

However, the installation failed because of missing dependencies.

A better way to install local `.deb` packages is:

```bash
sudo apt install ./icaclient-gcc-8_26.04.0.105_amd64.deb
```

Unlike `dpkg`, `apt` can automatically resolve dependencies available in the Ubuntu repositories.

If you have already used `dpkg` and ended up with a partially installed package, run:

```bash
sudo apt --fix-broken install
```

## Citrix Workspace Refused to Open

After completing the installation, Citrix Workspace appeared in the application menu.

However, clicking the icon did nothing.

The best way to troubleshoot an application that refuses to launch is to run it directly from the terminal.

```bash
/opt/Citrix/ICAClient/selfservice
```

This revealed the actual problem:

```text
error while loading shared libraries: libxml2.so.2:
cannot open shared object file: No such file or directory
```

## Finding All the Missing Libraries

Instead of fixing libraries one at a time, we can use `ldd` to find all missing dependencies.

Run:

```bash
ldd /opt/Citrix/ICAClient/selfservice | grep "not found"
```

In my case, the output was:

```text
libxml2.so.2 => not found
libsoup-2.4.so.1 => not found
libxml2.so.2 => not found
libsoup-2.4.so.1 => not found
libmanette-0.2.so.0 => not found
```

There were three missing libraries:

- `libxml2.so.2`
- `libsoup-2.4.so.1`
- `libmanette-0.2.so.0`

## Installing libsoup and libmanette

Fortunately, both `libsoup` and `libmanette` were available in the Ubuntu 26.04 repositories.

Install them using:

```bash
sudo apt install libsoup-2.4-1 libmanette-0.2-0
```

Now check the missing dependencies again:

```bash
ldd /opt/Citrix/ICAClient/selfservice | grep "not found"
```

The only remaining dependency should be:

```text
libxml2.so.2 => not found
```

## The libxml2 Problem

Ubuntu 26.04 ships with:

```text
libxml2.so.16
```

We can verify this using:

```bash
ldconfig -p | grep libxml2
```

The output on my system was:

```text
libxml2.so.16 (libc6,x86-64) =>
/usr/lib/x86_64-linux-gnu/libxml2.so.16
```

However, Citrix Workspace expects:

```text
libxml2.so.2
```

One tempting solution would be to create a symbolic link from `libxml2.so.16` to `libxml2.so.2`.

Don't do this.

These libraries have different ABIs, and pretending one version is another can result in crashes or unpredictable behaviour.

Instead, we can provide Citrix with an older compatibility library without modifying Ubuntu's system libraries.

## Creating a Private Compatibility Directory

Create a directory that will contain the older libraries required by Citrix:

```bash
mkdir -p ~/citrix-compat
```

Now download the Ubuntu 24.04 version of `libxml2`:

```bash
cd ~/Downloads

wget https://security.ubuntu.com/ubuntu/pool/main/libx/libxml2/libxml2_2.9.14+dfsg-1.3ubuntu3.8_amd64.deb
```

Instead of installing the old package system-wide, extract it into our compatibility directory:

```bash
dpkg-deb -x \
libxml2_2.9.14+dfsg-1.3ubuntu3.8_amd64.deb \
~/citrix-compat
```

Verify that the library was extracted:

```bash
find ~/citrix-compat -name "libxml2.so.2*"
```

The output should look similar to:

```text
/home/ankyte/citrix-compat/usr/lib/x86_64-linux-gnu/libxml2.so.2

/home/ankyte/citrix-compat/usr/lib/x86_64-linux-gnu/libxml2.so.2.9.14
```

## Launching Citrix with the Compatibility Library

We can now tell Citrix to load libraries from our compatibility directory using `LD_LIBRARY_PATH`.

Run:

```bash
LD_LIBRARY_PATH="$HOME/citrix-compat/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH" \
/opt/Citrix/ICAClient/selfservice
```

Unfortunately, this revealed one final missing dependency:

```text
error while loading shared libraries: libicuuc.so.74:
cannot open shared object file: No such file or directory
```

The older `libxml2` library depends on ICU 74, which is also no longer available by default on Ubuntu 26.04.

## Installing ICU 74 Privately

Download the ICU 74 package:

```bash
cd ~/Downloads

wget https://security.ubuntu.com/ubuntu/pool/main/i/icu/libicu74_74.2-1ubuntu3.1_amd64.deb
```

Extract it into the same compatibility directory:

```bash
dpkg-deb -x \
libicu74_74.2-1ubuntu3.1_amd64.deb \
~/citrix-compat
```

Now check for missing dependencies again:

```bash
LD_LIBRARY_PATH="$HOME/citrix-compat/usr/lib/x86_64-linux-gnu" \
ldd /opt/Citrix/ICAClient/selfservice | grep "not found"
```

If the command produces no output, all required libraries are available.

## Finally Launching Citrix Workspace

Launch Citrix Workspace:

```bash
LD_LIBRARY_PATH="$HOME/citrix-compat/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH" \
/opt/Citrix/ICAClient/selfservice
```

And Citrix Workspace should finally open.

## Creating a Convenient Launcher

Typing the complete `LD_LIBRARY_PATH` command every time isn't particularly convenient.

Create a wrapper script:

```bash
sudo nano /usr/local/bin/citrix-workspace
```

Add:

```bash
#!/bin/bash

export LD_LIBRARY_PATH="$HOME/citrix-compat/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH"

exec /opt/Citrix/ICAClient/selfservice "$@"
```

Save the file and make it executable:

```bash
sudo chmod +x /usr/local/bin/citrix-workspace
```

Now Citrix Workspace can be launched using:

```bash
citrix-workspace
```

## Wrapping Up

The main problem was that Citrix Workspace expected older versions of libraries that were no longer shipped by default with Ubuntu 26.04.

The missing dependencies were:

```text
libxml2.so.2
libsoup-2.4.so.1
libmanette-0.2.so.0
libicuuc.so.74
```

The libraries available directly from the Ubuntu 26.04 repositories could be installed normally.

For the older `libxml2` and ICU libraries, the safer solution was to extract them into a private compatibility directory and expose them only to Citrix using `LD_LIBRARY_PATH`.

This approach avoids downgrading Ubuntu's system libraries or creating unsafe symbolic links between incompatible library versions.

And after several missing libraries, dependency checks, and terminal commands, Citrix Workspace finally worked on Ubuntu 26.04.

Just another normal day of using Linux.
