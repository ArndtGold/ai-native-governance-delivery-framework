import process from "node:process";

// These tests assert English runtime copy. Pin the detected locale so a workstation without LANG,
// for example a de-DE Windows profile, behaves like CI. Tests of locale detection override it per call.
process.env.LC_ALL = "en_US.UTF-8";
