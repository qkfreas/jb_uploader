Jitterbit Jar Processor README
    Description
        The jar-processor.ps1 file is intended to automatically edit Jitterbit connector JARs with the values returned from the "Register a Connector" API. The required values to supply to this processor are:
            - The path to the Jitterbit JAR on the local disk.
            - The name of the connector (this will be the name in the Jitterbit Agent).
            - The Key, Secret, and EntityTypeID as returned from the aforementioned API call.

        Once the variables are entered, this processor will:
            - Unpackage the JAR provided with the JAR path to a temporary folder.
            - Edit the adaptor.json and META-INF/MANIFEST.MF files within the temporary folder.
            - Repackage the contents to a new JAR with the same name as the original.
            
        Note: The original JAR will be destroyed during this process.

    Prerequisites
        PowerShell
        The jar-processor.ps1 file
        Write access to JAR's parent folder

    Installation and Setup
        Ensure you have PowerShell installed on your system.
        Place the jar-processor.ps1 file in your desired directory.

    Usage
        To run the processor in PowerShell, you can either simply call the script:
            .\jar-processor.ps1

        Or run it with all its variables supplied:
            .\jar-processor.ps1 <path to Jitterbit JAR> <Connector Name> <Key> <Secret> <EntityTypeId>

        Example
            .\jar-processor.ps1 "C:\path\to\jitterbit.jar" "MyConnector" "your_key" "your_secret" "your_entity_type_id"
