BINDIR = ../bin
SRCDIR = src

CXX = g++
CXXFLAGS = -g -O2 -include $(SRCDIR)/config.h
LDFLAGS = 
LIBS = -lpng 

WIG2PNG_TARGET = $(BINDIR)/wig2png
WIG2PNG_SRCFILES = $(wildcard $(SRCDIR)/*)

all: $(WIG2PNG_TARGET)

clean:
	rm $(WIG2PNG_TARGET)

$(WIG2PNG_TARGET): $(WIG2PNG_SRCFILES)
	$(CXX) $(CXXFLAGS) -o $@ $(SRCDIR)/wig2png.cc $(SRCDIR)/opts_list.cc $(LDFLAGS) $(LIBS)

.PHONY: all clean
