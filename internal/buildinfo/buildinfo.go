// Package buildinfo exposes compile-time metadata shared across the server.
package buildinfo

// The following variables are overridden via ldflags during release builds.
// Defaults cover local development builds.
var (
	// Version is the semantic version or git describe output of the binary.
	Version = "v2.0.8"

	// Commit is the git commit SHA baked into the binary.
	Commit = "none"

	// BuildDate records when the binary was built in UTC.
	BuildDate = "unknown"

	// FrontendVersion is the management panel version baked into this binary image.
	FrontendVersion = "v2.0.8"

	// FrontendCommit is the codeProxy commit SHA baked into this binary image.
	FrontendCommit = "none"

	// FrontendRef is the codeProxy branch or ref used for the embedded panel.
	FrontendRef = "main"
)
