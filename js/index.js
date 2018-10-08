var app = new Vue({
    el: "#app",
    data: {
        debug: false,
        location: 0,
        database: [],
        thread: {},
        comments: [],
        new_comment: "",
        new_thread_title: "",
        new_thread_body: "",
    },
    methods: {
        find_by_id: function(id) {
            for(i=0; i<this.database.length; i++) {
                if ( this.database[i].id == id ) {
                    return i;
                }
            }
        },
        load_database: function() {
            var that = this;
            $.ajax({
                url: "/data/database.json",
                cache: false,
                async: false,
            }).done(function (data) {
                that.database = data;
            });
        },
        load_thread(id) {
            this.location = id;
            var target = this.find_by_id(id);
            this.thread = this.database[target];
            // comments
            this.load_comments(id);
        },
        load_comments(id) {
            this.comments = [];
            if (id != 0) {
                for(i=0; i<this.database.length; i++) {
                    if ( this.database[i].parent == id ) {
                        this.comments.push(this.database[i]);
                    }
                }
            }
        },
        count_comments(id) {
            var count = 0;
            for(i=0; i<this.database.length; i++) {
                if(this.database[i].parent == id) {
                    count++;
                }
            }
            return count;  
        },
        add_comment(parent) {
            if(this.new_comment != "") {
                this.database.push({
                    id: this.database[this.database.length-1].id+1,
                    title: "n/a",
                    body: this.new_comment,
                    parent: parent
                });
                this.new_comment = "";
                this.save_database();
                this.load_comments(parent);
            }
        },
        add_thread() {
            var new_id;
            if(this.database.length == 0) {
                new_id = 1;
            } else {
                new_id = this.database[this.database.length-1].id+1;
            }
            if( (this.new_thread_title != "") && (this.new_thread_body != "") ) {
                this.database.push({
                    id: new_id,
                    title: this.new_thread_title,
                    body: this.new_thread_body,
                    parent: 0
                });
                this.new_thread_title = "";
                this.new_thread_body = "";
                this.save_database();
                this.load_database();
            }
        },
        delete_comment(comment_id, thread_id) {
            var target = this.find_by_id(comment_id);
            this.database.splice(target, 1);
            this.save_database();
            this.load_comments(thread_id);
        },
        delete_thread(thread_id) {
            for(i=0; i<this.database.length; i++) {
                if(this.database[i].parent == thread_id) {
                    var target = this.find_by_id(this.database[i].id);
                    this.database.splice(target, 1);
                }
            }
            
            var target = this.find_by_id(thread_id);
            this.database.splice(target, 1);
            
            this.save_database();
            this.load_database();
        },
        save_database() {
            var that = this;
            $.ajax({
                type: "POST",
                url: "/data/saver.php",
                cache: false,
                async: false,
                data: {
                    action: 'save',
                    stream: JSON.stringify(that.database)
                }
            });
        }
    },
    mounted: function() {
        this.load_database();
    }
});

document.onkeydown = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode == 27) {
        app.location = 0;
    }
};