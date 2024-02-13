---
author: DotIN13
layout: post
locale: en-us
series: Jellyfin x Manjaro
subtitle: null
tags:
- Jellyfin
- Manjaro
- File Permission
title: "Chapter 2: The Failures of Adding Directories and the Perplexing World of Permissions"
---

In the previous episode, we encountered errors while trying to add a movie directory to Jellyfin.

Upon clicking "Add," an error message popped up, stating:

```plaintext
The path could not be found. Please ensure the path is valid and try again.
```

Alternatively, an error prompt appeared below:

```plaintext
There was an error adding the media path. Please ensure the path is valid and Jellyfin has access to that location.
```

{% include post-image.html link="post-jellyfin/media-path-error.png" alt="Media Import Error" %}

## Parent Directory Permissions

I attempted to modify the movie directory permissions to `drwxrwxrwx`, and change the owner to `jellyfin:jellyfin`, but it had no effect.

Further attempts to use `setfacl` to modify ACL revealed that my ZFS directory did not have ACL enabled at all.

Recalling past knowledge that for displaying directory contents, users require execute permissions for the parent directory, I experimented by changing the parent directory of the movie directory to `drwxr-xr-x`. Subsequently, when adding the movie directory from Jellyfin, it could be added successfully.

## Testing for Everyone

I decided to relocate the `testdrive` directory to the root directory and place the movie storage directory `movies` within it. After adjusting the permissions of the `testdrive` directory, I attempted to add the `movies` directory in Jellyfin.

During testing, the Jellyfin service user was `jellyfin`, and the user group was also `jellyfin`. The initial conditions of the test were as follows:

```shell
/
└── [drwx------ brustier jellyfin   ]  testdrive
    └── [drwxr-xr-x jellyfin jellyfin]  movies
```

Considering only the `read` and `execute` permissions that affect reading, there are a total of 16 scenarios. The test results are as follows:

| Parent Directory Permissions | Jellyfin Can Add Subdirectory |
| ----------------------------- | ----------------------------- |
| \-\-\-\-\-\-                 | ❌                             |
| r\-\-\-\-\-                  | ❌                             |
| \-\-x\-\-\-                  | ✔️                           |
| \-\-\-r\-\-                  | ❌                             |
| \-\-\-\-\-x                  | ❌                             |
| r\-x\-\-\-                   | ✔️                           |
| r\-\-r\-\-                   | ❌                             |
| r\-\-\-\-x                   | ❌                             |
| \-\-xr\-\-                   | ✔️                           |
| \-\-x\-\-x                   | ✔️                           |
| \-\-\-r\-x                  | ❌                             |
| r\-xr\-\-                   | ✔️                           |
| r\-x\-\-x                   | ✔️                           |
| r\-\-r\-x                   | ❌                             |
| \-\-xr\-x                  | ✔️                           |
| r\-xr\-x                   | ✔️                           |

The test results indicate that as long as the parent directory has the "group execute permission" (g+x), Jellyfin can correctly access the subdirectories.

However, the issue lies in the fact that if the parent directory has only the "other execute permission" (o+x), Jellyfin cannot access the subdirectory properly. The underlying reasons behind this still require further exploration.

## To Understand or Not to Understand?

As mentioned previously, when you think of something you want to do, you should just go ahead and do it.

Finding an answer to this issue might only take a few seconds of searching. I already have the search keywords in mind, let's call it "parent folder execution permission".

Yet, I find myself unwilling to open up that search interface. I don't know why.

Why is it that the simplest things always seem to be the hardest to accomplish?

