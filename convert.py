with open("graph.json") as f:
	with open("graph2.json", "a") as f2:
	    lines = f.readlines()
	    i = 0
	    for line in lines:
	    	line = line.replace('}], "', '}]}, {"')
	    	i = i + 1
	    	f2.write(line)
